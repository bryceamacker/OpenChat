// Reimplement with ChromaDB instead of Pinecone
import { ChromaClient } from 'chromadb'


async function initChroma() {
  try {
    const client = new ChromaClient({
      path: process.env.CHROMA_HOST + ':' + process.env.CHROMA_PORT
    });

    return client;
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to initialize Chroma Client');
  }
}

export const chroma = await initChroma();
