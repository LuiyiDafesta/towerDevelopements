/**
 * Comprime y redimensiona una imagen en el cliente de forma nativa utilizando HTML5 Canvas.
 * Esto evita el uso de librerías externas pesadas y optimiza el rendimiento.
 * 
 * @param file El archivo de imagen original seleccionado por el usuario.
 * @param maxWidth Ancho máximo permitido (por defecto 1920px).
 * @param maxHeight Alto máximo permitido (por defecto 1080px).
 * @param quality Calidad de compresión entre 0 y 1 (por defecto 0.8).
 * @returns Una promesa que se resuelve con el nuevo archivo File comprimido en formato JPEG.
 */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve) => {
    // Si no es un archivo de tipo imagen, no realizamos ninguna compresión
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Redimensionar de forma proporcional si excede los límites
        if (width > maxWidth || height > maxHeight) {
          const widthRatio = maxWidth / width;
          const heightRatio = maxHeight / height;
          const bestRatio = Math.min(widthRatio, heightRatio);

          width = width * bestRatio;
          height = height * bestRatio;
        }

        // Crear el canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Si el navegador no soporta canvas 2D, retornamos el archivo original
          return resolve(file);
        }

        // Dibujar la imagen redimensionada en el canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir el canvas a Blob en formato JPEG con la calidad especificada
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }

            // Generar el nombre de archivo con extensión .jpg
            const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const newFileName = `${originalNameWithoutExt}.jpg`;

            // Crear el nuevo archivo File comprimido
            const compressedFile = new File([blob], newFileName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            console.log(
              `[ImageCompression] Compresión finalizada para: ${file.name}. ` +
              `Tamaño original: ${(file.size / 1024 / 1024).toFixed(2)} MB -> ` +
              `Nuevo tamaño: ${(compressedFile.size / 1024).toFixed(2)} KB. ` +
              `Reducción del: ${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`
            );

            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        // En caso de error al cargar la imagen, retornamos el archivo original
        resolve(file);
      };
    };

    reader.onerror = () => {
      // En caso de error al leer el archivo, retornamos el archivo original
      resolve(file);
    };
  });
}
