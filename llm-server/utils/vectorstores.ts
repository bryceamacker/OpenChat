import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

import { PINECONE_INDEX_NAME } from '@/config/pinecone';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { PineconeClient } from '@pinecone-database/pinecone';
import {pinecone} from '@/utils/pinecone-client';

import { MILVUS_INDEX_NAME } from '@/config/milvus';
import { Milvus, MilvusLibArgs } from "langchain/vectorstores/milvus";

// import { VectorStore } from 'langchain/dist/vectorstores/base';
import { Embeddings } from 'langchain/dist/embeddings/base';
import { BaseRetriever } from 'langchain/dist/schema';
import { Document } from 'langchain/document';
import { MilvusClient } from '@zilliz/milvus2-sdk-node';
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
    embeddings!: Embeddings;

    addVectors(vectors: number[][], documents: Document<Record<string, any>>[]): Promise<void> {
        throw new Error('Method not implemented.');
    }
    addDocuments(documents: Document<Record<string, any>>[]): Promise<void> {
        throw new Error('Method not implemented.');
    }
    similaritySearchVectorWithScore(query: number[], k: number, filter?: object | undefined): Promise<[Document<Record<string, any>>, number][]> {
        throw new Error('Method not implemented.');
    }
    similaritySearch(query: string, k?: number | undefined, filter?: object | undefined): Promise<Document<Record<string, any>>[]> {
        throw new Error('Method not implemented.');
    }
    similaritySearchWithScore(query: string, k?: number | undefined, filter?: object | undefined): Promise<[object, number][]> {
        throw new Error('Method not implemented.');
    }
    asRetriever(k?: number | undefined): BaseRetriever {
        throw new Error('Method not implemented.');
    }

    async fromDocuments(docs: Document[], embeddings: Embeddings, options: any): Promise<any> {
        const index = this.pinecone.Index(options.genericIndex);
        const namespace = options.namespace;
        const textKey = options.textKey;
        console.log('pinecone index', index);
        console.log('pinecone namespace', namespace);
        console.log('pinecone textKey', textKey);

        await PineconeStore.fromDocuments(docs, embeddings, {
            pineconeIndex: index,
            namespace: namespace,
            textKey: textKey,
        });
    }
}

// Concrete implementation for Milvus
class MilvusVectorStore implements VectorStore {
    // private milvusStore: Milvus;
    private milvusOptions: MilvusLibArgs;

    constructor(embeddings: Embeddings, args: MilvusLibArgs) {
        this.milvusOptions = {
            collectionName: MILVUS_INDEX_NAME,
            url: process.env.MILVUS_URL,
            ssl: process.env.MILVUS_SSL === 'true',
            username: process.env.MILVUS_USERNAME,
            password: process.env.MILVUS_PASSWORD,
            primaryField: 'id',
            vectorField: 'vector',
            textField: 'text',
        };
    }
    embeddings!: Embeddings;
    addVectors(vectors: number[][], documents: Document<Record<string, any>>[]): Promise<void> {
        throw new Error('Method not implemented.');
    }
    addDocuments(documents: Document<Record<string, any>>[]): Promise<void> {
        throw new Error('Method not implemented.');
    }
    similaritySearchVectorWithScore(query: number[], k: number, filter?: object | undefined): Promise<[Document<Record<string, any>>, number][]> {
        throw new Error('Method not implemented.');
    }
    similaritySearch(query: string, k?: number | undefined, filter?: object | undefined): Promise<Document<Record<string, any>>[]> {
        throw new Error('Method not implemented.');
    }
    similaritySearchWithScore(query: string, k?: number | undefined, filter?: object | undefined): Promise<[object, number][]> {
        throw new Error('Method not implemented.');
    }
    asRetriever(k?: number | undefined): BaseRetriever {
        throw new Error('Method not implemented.');
    }

    async fromDocuments(docs: Document[], embeddings: Embeddings, options: any): Promise<any> {
        const milvusOptions: MilvusLibArgs = {
            collectionName: options.genericIndex || this.milvusOptions.collectionName,
            primaryField: options.primaryField,
            vectorField: options.vectorField,
            textField: options.textField,
        };
        await Milvus.fromDocuments(docs, embeddings, milvusOptions);
        // use the Milvus store to handle the documents
        // ... as described in the Milvus usage&#8203;``oaicite:{"number":3,"metadata":{"title":"Milvus | 🦜️🔗 Langchain","url":"https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/milvus","text":"import { Milvus } from \"langchain/vectorstores/milvus\";  \n    import { OpenAIEmbeddings } from \"langchain/embeddings/openai\";  \n\n    // text sample from Godel, Escher, Bach   \n    const vectorStore = await Milvus.fromTexts(  \n      [  \n        \"Tortoise: Labyrinth? Labyrinth? Could it Are we in the notorious Little\\  \n                Harmonic Labyrinth of the dreaded Majotaur?\",  \n        \"Achilles: Yiikes! What is that?\",  \n        \"Tortoise: They say-although I person never believed it myself-that an I\\  \n                Majotaur has created a tiny labyrinth sits in a pit in the middle of\\  \n                it, waiting innocent victims to get lost in its fears complexity.\\  \n                Then, when they wander and dazed into the center, he laughs and\\  \n                laughs at them-so hard, that he laughs them to death!\",  \n        \"Achilles: Oh, no!\",  \n        \"Tortoise: But it's only a myth. Courage, Achilles.\",  \n      ],  \n      [{ id: 2 }, { id: 1 }, { id: 3 }, { id: 4 }, { id: 5 }],  \n      new OpenAIEmbeddings(),  \n      {  \n        collectionName: \"goldel_escher_bach\",  \n      }  \n    );  \n\n    // or alternatively from docs   \n    const vectorStore = await Milvus.fromDocuments(docs, new OpenAIEmbeddings(), {  \n      collectionName: \"goldel_escher_bach\",  \n    });  \n\n    const response = await vectorStore.similaritySearch(\"scared\", 2","pub_date":null}}``&#8203;
    }

    // ... other methods specific to Milvus
}

// Factory for creating the correct VectorStore based on the environment variable
export class VectorStoreFactory {
    static create(embeddings: Embeddings, options: any): VectorStore {
        const dbType = process.env.VECTOR_BACKEND;

        switch (dbType?.toUpperCase()) {
            case 'PINECONE':
                return new PineconeVectorStore();
            case 'MILVUS':
                return new MilvusVectorStore(embeddings, options);
            default:
                throw new Error(`Unsupported DB_TYPE: ${dbType}`);
        }
    }
}


// Usage:
