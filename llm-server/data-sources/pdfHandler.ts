import type {NextApiRequest, NextApiResponse} from 'next';
import {PINECONE_INDEX_NAME} from '@/config/pinecone';
import {DirectoryLoader} from 'langchain/document_loaders/fs/directory';
import {CustomPDFLoader} from '@/utils/customPDFLoader';
import {RecursiveCharacterTextSplitter} from 'langchain/text_splitter';
import {OpenAIEmbeddings} from 'langchain/embeddings/openai';
import {PineconeStore} from 'langchain/vectorstores/pinecone';
import {pinecone} from '@/utils/pinecone-client';
import {VectorStoreFactory} from 'utils/vectorstores';
import { Milvus } from 'langchain/vectorstores/milvus';
/* eslint-disable @typescript-eslint/no-explicit-any */
import weaviate from "weaviate-ts-client";
import { WeaviateStore } from "langchain/vectorstores/weaviate";


export default async function pdfHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const {shared_folder} = req.body;
        const namespace = req.body.namespace;

        const directoryLoader = new DirectoryLoader("/app/shared_data/" + shared_folder, {
            '.pdf': (path: string | Blob) => new CustomPDFLoader(path),
        })

        const rawDocs = await directoryLoader.load();

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000, chunkOverlap: 200,
        });

        const docs = await textSplitter.splitDocuments(rawDocs);

        // const embeddings = new OpenAIEmbeddings();
        const embeddings = new OpenAIEmbeddings({
            azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
            azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME,
          });
        const client = (weaviate as any).client({
            scheme: process.env.WEAVIATE_SCHEME || "https",
            host: process.env.WEAVIATE_HOST || "localhost",
            // apiKey: new (weaviate as any).ApiKey(
            //   process.env.WEAVIATE_API_KEY || "default"
            // ),
          });

          await WeaviateStore.fromDocuments(docs, embeddings, {
            client: client,
            indexName: process.env.WEAVIATE_INDEX_NAME || "",
          });
        // const index = pinecone.Index(PINECONE_INDEX_NAME);


        // await PineconeStore.fromDocuments(docs, embeddings, {
        //     pineconeIndex: index,
        //     namespace: namespace,
        //     textKey: 'text',
        // });
        // await Milvus.fromDocuments(docs, embeddings, {
        //     collectionName: process.env.MILVUS_INDEX_NAME,
        //     url: process.env.MILVUS_URL,
        //   });

                console.log('All is done, folder deleted');
                return res.status(200).json({message: 'Success'});
            } catch (e) {
                console.error(e);
                // @ts-ignore
                res.status(500).json({error: e.message, line: e.lineNumber});
            }
        }
