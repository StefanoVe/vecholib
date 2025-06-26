import { RequiredEnvVariableError } from '../errors';

export const declareEnvs = (envs: string[]) => {
  envs.forEach((name) => {
    if (!Bun.env[name]) {
      console.error(`missing env variable`, name);
      throw new RequiredEnvVariableError(name);
    }
  });

  return Bun.env as { [key: string]: string };
};

export const isProduction = () => Bun.env.BUN_ENV === 'production';
