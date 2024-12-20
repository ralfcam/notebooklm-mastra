import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Knowledge base operations
export async function addSource({ name, type, url }: { name: string; type: string; url?: string }) {
  return prisma.source.create({
    data: { name, type, url }
  });
}

export async function addChunkWithEmbedding({ 
  content, 
  sourceId, 
  embedding 
}: { 
  content: string; 
  sourceId: string; 
  embedding: number[] 
}) {
  return prisma.chunk.create({
    data: {
      content,
      sourceId,
      embedding: {
        create: {
          vector: embedding
        }
      }
    },
    include: {
      embedding: true
    }
  });
}

export async function deleteSource(sourceId: string) {
  // This will cascade delete related chunks and embeddings
  return prisma.source.delete({
    where: { id: sourceId }
  });
}

export async function searchSimilarChunks(queryVector: number[], limit: number = 5) {
  // Note: This is a basic implementation. You might want to add more sophisticated 
  // vector similarity search using PostgreSQL extensions like pgvector
  const chunks = await prisma.chunk.findMany({
    include: {
      embedding: true,
      source: true
    },
    take: limit
  });

  // For now, we'll implement a basic cosine similarity in JavaScript
  // In production, you should use a proper vector similarity search
  return chunks.map(chunk => ({
    chunk,
    similarity: cosineSimilarity(queryVector, chunk.embedding?.vector || [])
  }))
  .sort((a, b) => b.similarity - a.similarity);
}

// Utility function for cosine similarity
function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) return 0;
  
  const dotProduct = vectorA.reduce((acc, val, i) => acc + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((acc, val) => acc + val * val, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((acc, val) => acc + val * val, 0));
  
  return dotProduct / (magnitudeA * magnitudeB);
}