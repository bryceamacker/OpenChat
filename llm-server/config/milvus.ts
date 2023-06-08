/**
 * Change the namespace to the namespace on MILVUS you'd like to store your embeddings.
 */

// if (!process.env.MILVUS_INDEX_NAME) {
//   throw new Error('Missing Milvus index name in .env file');
// }

const MILVUS_INDEX_NAME = process.env.MILVUS_INDEX_NAME ?? '';

const MILVUS_NAME_SPACE = 'bot-test'; //namespace is optional for your vectors

export { MILVUS_INDEX_NAME, MILVUS_NAME_SPACE };
