import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/features/auth/AuthContext'

export function useSubirAvatar() {
  const qc = useQueryClient()
  const { usuario } = useAuth()

  return useMutation({
    mutationFn: async (file: File) => {
      if (!usuario) throw new Error('No hay sesión activa')

      const extension = file.name.split('.').pop()
      const path = `${usuario.id_usuario}/perfil.${extension}`

      const { error: errUpload } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, cacheControl: '3600' })
      if (errUpload) throw errUpload

      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = `${pub.publicUrl}?t=${Date.now()}`

      const { error: errUpdate } = await supabase
        .from('usuario')
        .update({ avatar_url: url })
        .eq('id_usuario', usuario.id_usuario)
      if (errUpdate) throw errUpdate

      return url
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] })
    },
  })
}