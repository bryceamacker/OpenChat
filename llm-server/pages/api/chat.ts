import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { Milvus } from 'langchain/vectorstores/milvus';
/* eslint-disable @typescript-eslint/no-explicit-any */
import weaviate from "weaviate-ts-client";
import { WeaviateStore } from "langchain/vectorstores/weaviate";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
  const { question, history, namespace, mode } = req.body;

  console.log('req.body', req.body);
  console.log({ question, history, namespace, mode });
  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  try {
    // const index = pinecone.Index(PINECONE_INDEX_NAME);

    /* create vectorstore*/
    // const vectorStore = await PineconeStore.fromExistingIndex(
    //     new OpenAIEmbeddings({}),
    //     {
    //       pineconeIndex: index,
    //       textKey: 'text',
    //       namespace: namespace, //namespace comes from your config folder
    //     },
    // );
    const client = (weaviate as any).client({
      scheme: process.env.WEAVIATE_SCHEME || "https",
      host: process.env.WEAVIATE_HOST || "localhost",
      // apiKey: new (weaviate as any).ApiKey(
      //   process.env.WEAVIATE_API_KEY || "default"
      // ),
    });
    const embeddings = new OpenAIEmbeddings({
      azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
      azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME,
      azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_EMBEDDINGS_VERSION
    });
    const vectorStore = await WeaviateStore.fromExistingIndex(embeddings, {
      client: client,
      indexName: process.env.WEAVIATE_INDEX_NAME || "",
    });

  //   const vectorStore = await Milvus.fromExistingCollection(
  //     new OpenAIEmbeddings({}),
  //     {
  //       collectionName: process.env.MILVUS_INDEX_NAME || '',
  //       url: process.env.MILVUS_URL,
  //     },
  // );
    //create chain
    const chain = makeChain(vectorStore, mode);
    //Ask a question using chat history
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: history || [],
    });

    console.log('response', response);
    res.status(200).json(response);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}