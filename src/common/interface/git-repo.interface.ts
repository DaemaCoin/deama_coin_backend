export interface GithubRepoI {
  full_name: string;
  permissions: {
    push: boolean;
  };
}
