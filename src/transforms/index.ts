import { Block } from '../primitives';

export type Transform = (Block) => Block;

export { default as indent } from './indent';
