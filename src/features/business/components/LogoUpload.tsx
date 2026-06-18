/**
 * Quotr — LogoUpload
 * 
 * Handles business logo selection and upload to Supabase Storage.
 * Supports both web (file input) and native (Capacitor Camera).
 */

import { useState, useRef } from 'react'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'
import { supabase, storage } from '../../../lib/supabase'
import { useAuth } from '../../auth/AuthContext'
import { Button } from '../../../components/ui/Button'
import { FormError } from '../../../components/ui/FormError'

interface LogoUploadProps {
  onComplete: (url: string) => void
  currentUrl?: string | null
}

export function LogoUpload({ onComplete, currentUrl }: LogoUploadProps) {
  const { business } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File | Blob) => {
    if (!business) return

    setIsUploading(true)
    setError(null)

    try {
      const fileExt = file instanceof File ? file.name.split('.').pop() : 'png'
      const fileName = `${business.id}/logo-${Math.random()}.${fileExt}`
      const filePath = fileName

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await storage.logos().upload(filePath, file, {
        upsert: true,
        contentType: file instanceof File ? file.type : 'image/png'
      })

      if (uploadError) throw uploadError

      // 2. Get Public URL
      const { data: { publicUrl } } = storage.logos().getPublicUrl(filePath)

      // 3. Update Business record
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ logo_url: publicUrl })
        .eq('id', business.id)

      if (updateError) throw updateError

      setPreviewUrl(publicUrl)
      onComplete(publicUrl)
    } catch (err: any) {
      console.error('Logo upload error:', err)
      setError(err.message || 'Failed to upload logo. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const pickImage = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: true,
          resultType: CameraResultType.Uri,
          source: CameraSource.Prompt
        })

        if (image.webPath) {
          const blob = await fetch(image.webPath).then(r => r.blob())
          handleUpload(blob)
        }
      } catch (err) {
        // User cancelled or permission denied
        console.log('Camera cancelled')
      }
    } else {
      fileInputRef.current?.click()
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  return (
    <div className="logo-upload">
      <div className="logo-preview-container">
        {previewUrl ? (
          <img src={previewUrl} alt="Business logo" className="logo-preview-img" />
        ) : (
          <div className="logo-placeholder">
            <i className="ti ti-photo" />
          </div>
        )}
        {isUploading && (
          <div className="logo-uploading-overlay">
            <div className="spinner" />
          </div>
        )}
      </div>

      <div className="logo-actions">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={pickImage}
          disabled={isUploading}
        >
          {previewUrl ? 'Change Logo' : 'Upload Logo'}
        </Button>
        <p className="logo-hint">
          Professional quotes look better with a logo.
        </p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="sr-only"
        accept="image/*"
        onChange={onFileChange}
      />

      {error && <FormError message={error} />}

      <style>{`
        .logo-upload {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 16px;
          background: var(--color-background-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
        }

        .logo-preview-container {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: var(--radius-sm);
          background: var(--color-background-tertiary);
          border: 1px dashed var(--color-border);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .logo-preview-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .logo-placeholder {
          font-size: 32px;
          color: var(--color-text-tertiary);
        }

        .logo-uploading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-actions {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .logo-hint {
          font-size: 12px;
          color: var(--color-text-secondary);
          margin: 0;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid var(--color-accent);
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
