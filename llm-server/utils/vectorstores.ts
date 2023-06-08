import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PINECONE_INDEX_NAME } from '@/config/pinecone';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { PineconeClient } from '@pinecone-database/pinecone';
// import {pinecone} from '@/utils/pinecone-client';

import { MILVUS_INDEX_NAME } from '@/config/milvus';
import { Milvus } from "langchain/vectorstores/milvus";

// Define the generic VectorStore interface
interface VectorStore {
    fromDocuments(docs: any, embeddings: any, options: any): Promise<any>;
}

class PineconeVectorStore implements VectorStore {
    private pinecone: PineconeClient;

    constructor() {
        if (!process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_API_KEY) {
            throw new Error('Pinecone environment or api key vars missing');
        }
        try {
            const pinecone = new PineconeClient();
            pinecone.init({
                environment: process.env.PINECONE_ENVIRONMENT ?? '', //this is in the dashboard
                apiKey: process.env.PINECONE_API_KEY ?? '',
            });
            this.pinecone = pinecone;
        } catch (error) {
            console.log('error', error);
            throw new Error('Failed to initialize Pinecone Client, please make sure you have the correct environment and api keys');
        }
    }

    async fromDocuments(docs: any, embeddings: any, options: any): Promise<any> {
        const index = this.pinecone.Index(options.genericIndex);
        const namespace = options.namespace;
        const textKey = options.textKey;

        await PineconeStore.fromDocuments(docs, embeddings, {
            pineconeIndex: index,
            namespace: namespace,
            textKey: textKey,
        });
    }
}

// Concrete implementation for Milvus
class MilvusVectorStore implements VectorStore {
    private milvusStore: Milvus;

    constructor() {
        // initialize Milvus
        // ... as described in the Milvus setup&#8203;``oaicite:{"number":3,"metadata":{"title":"Milvus | 🦜️🔗 Langchain","url":"https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/milvus","text":"Milvus is a vector database built for embeddings similarity search and AI applications.\n\nCompatibility \n\nOnly available on Node.js.\n\n## Setup \n\n  1. Run Milvus instance with Docker on your computer docs\n\n  2. Install the Milvus Node.js SDK.\n\n    * npm \n    * Yarn \n    * pnpm \n\n        npm install -S @zilliz/milvus2-sdk-node   \n\n        yarn add @zilliz/milvus2-sdk-node   \n\n        pnpm add @zilliz/milvus2-sdk-node","pub_date":null}}``&#8203;
    }

    async fromDocuments(docs: any, embeddings: any, options: any): Promise<any> {
        // use the Milvus store to handle the documents
        // ... as described in the Milvus usage&#8203;``oaicite:{"number":3,"metadata":{"title":"Milvus | 🦜️🔗 Langchain","url":"https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/milvus","text":"import { Milvus } from \"langchain/vectorstores/milvus\";  \n    import { OpenAIEmbeddings } from \"langchain/embeddings/openai\";  \n\n    // text sample from Godel, Escher, Bach   \n    const vectorStore = await Milvus.fromTexts(  \n      [  \n        \"Tortoise: Labyrinth? Labyrinth? Could it Are we in the notorious Little\\  \n                Harmonic Labyrinth of the dreaded Majotaur?\",  \n        \"Achilles: Yiikes! What is that?\",  \n        \"Tortoise: They say-although I person never believed it myself-that an I\\  \n                Majotaur has created a tiny labyrinth sits in a pit in the middle of\\  \n                it, waiting innocent victims to get lost in its fears complexity.\\  \n                Then, when they wander and dazed into the center, he laughs and\\  \n                laughs at them-so hard, that he laughs them to death!\",  \n        \"Achilles: Oh, no!\",  \n        \"Tortoise: But it's only a myth. Courage, Achilles.\",  \n      ],  \n      [{ id: 2 }, { id: 1 }, { id: 3 }, { id: 4 }, { id: 5 }],  \n      new OpenAIEmbeddings(),  \n      {  \n        collectionName: \"goldel_escher_bach\",  \n      }  \n    );  \n\n    // or alternatively from docs   \n    const vectorStore = await Milvus.fromDocuments(docs, new OpenAIEmbeddings(), {  \n      collectionName: \"goldel_escher_bach\",  \n    });  \n\n    const response = await vectorStore.similaritySearch(\"scared\", 2","pub_date":null}}``&#8203;
    }

    // ... other methods specific to Milvus
}

// Factory for creating the correct VectorStore based on the environment variable
class VectorStoreFactory {
    static create(): VectorStore {
        const dbType = process.env.DB_TYPE;

        switch (dbType) {
            case 'PINECONE':
                return new PineconeVectorStore();
            case 'MILVUS':
                return new MilvusVectorStore();
            default:
                throw new Error(`Unsupported DB_TYPE: ${dbType}`);
        }
    }
}

// Usage:
// const vectorStore = VectorStoreFactory.create();
// await vectorStore.fromDocuments(docs, embeddings, {
//   genericIndex: index,
//   namespace: namespace,
//   textKey: 'text',
// });
