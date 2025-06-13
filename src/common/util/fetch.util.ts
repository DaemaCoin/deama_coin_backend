import { GithubException } from 'src/exception/custom-exception/github.exception';

export enum FetchMethod {
  GET = 'get',
  POST = 'post',
}

export async function githubFetch<T>(
  url: string,
  expectStatus: number[],
  options: RequestInit,
): Promise<T> {
  const res = await fetch(url, options);

  if (!expectStatus.includes(res.status)) {
    const contentType = res.headers.get('content-type') || '';

    let errorMessage = `Github API Error: ${res.status}`;

    if (contentType.includes('application/json')) {
      const errorData = await res.json().catch(() => ({}));
      errorMessage = errorData?.message || errorMessage;
    }

    throw new GithubException(errorMessage, res.status);
  }

  return res.json() as Promise<T>;
}