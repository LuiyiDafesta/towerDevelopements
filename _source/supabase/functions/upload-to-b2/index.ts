import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejar CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Obtener los datos del FormData enviado desde el cliente
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const path = formData.get('path') as string | null

    if (!file || !path) {
      return new Response(
        JSON.stringify({ error: 'Falta el archivo (file) o la ruta de destino (path) en la solicitud.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Leer credenciales desde las variables de entorno de Supabase
    const b2KeyId = Deno.env.get('B2_APPLICATION_KEY_ID')
    const b2AppKey = Deno.env.get('B2_APPLICATION_KEY')
    const b2Bucket = Deno.env.get('B2_BUCKET_NAME')
    const b2Endpoint = Deno.env.get('B2_ENDPOINT')

    if (!b2KeyId || !b2AppKey || !b2Bucket || !b2Endpoint) {
      return new Response(
        JSON.stringify({ error: 'Las credenciales de Backblaze B2 no están configuradas en las variables de entorno de Supabase.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Configurar el cliente S3 compatible con Backblaze B2
    const region = b2Endpoint.split('.')[1] || 'us-west-004'
    const s3Client = new S3Client({
      endpoint: `https://${b2Endpoint}`,
      region: region,
      credentials: {
        accessKeyId: b2KeyId,
        secretAccessKey: b2AppKey,
      },
    })

    // Convertir el archivo a un buffer legible por S3Client
    const fileBuffer = await file.arrayBuffer()
    
    // Subir el archivo al bucket de Backblaze B2
    await s3Client.send(
      new PutObjectCommand({
        Bucket: b2Bucket,
        Key: path,
        Body: new Uint8Array(fileBuffer),
        ContentType: file.type,
      })
    )

    // Construir la URL pública de Backblaze B2 (API compatible con S3)
    const publicUrl = `https://${b2Bucket}.${b2Endpoint}/${path}`

    return new Response(
      JSON.stringify({ publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Error desconocido al subir el archivo.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
