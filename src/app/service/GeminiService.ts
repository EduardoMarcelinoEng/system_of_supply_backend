import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv'; 
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({
    // Choose a Gemini model.
    model: "gemini-1.5-pro",
});
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY as string);

class GeminiService {

    recognizeImage(image: string, text: string) {
        return new Promise((resolve, reject)=>{
            fileManager.uploadFile(image, {
                mimeType: "image/jpeg",
                displayName: uuidv4(),
            })
                .then(result=>{
                    model.generateContent([
                        {
                          fileData: {
                            mimeType: result.file.mimeType,
                            fileUri: result.file.uri
                          }
                        },
                        { text },
                    ])
                        .then(result=>resolve(result.response.text()))
                        .catch(err=>reject(err.message))
                        .finally(()=>fileManager.deleteFile(result.file.name));
                })
                .catch(err=>reject(err.message));
        });
    }

}

export default new GeminiService();