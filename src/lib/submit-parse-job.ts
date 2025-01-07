import { parsingStatus } from "@/db/schema/sources";

const API_KEY = process.env.LLAMA_CLOUD_API_KEY!;
const BASE_URL = "https://api.cloud.llamaindex.ai/api";

export const submitParseJob = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/parsing/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: "application/json",
    },
    body: formData,
  });

  if (response.ok) {
    return (await response.json()) as {
      id: string;
      status: (typeof parsingStatus.enumValues)[number];
    };
  } else {
    throw new Error(response.statusText);
  }
};

export const pollJobStatus = async (jobId: string) => {
  const response = await fetch(`${BASE_URL}/parsing/job/${jobId}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: "application/json",
    },
  });

  if (response.ok) {
    return (await response.json()) as {
      id: string;
      status: (typeof parsingStatus.enumValues)[number];
    };
  } else {
    console.dir(response, { depth: Infinity });
    throw new Error(response.statusText);
  }
};
