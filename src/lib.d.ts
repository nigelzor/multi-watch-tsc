declare module 'graph-sequencer' {
    type Graph<T> = Map<T, Array<T>>;
    type Groups<T> = Array<Array<T>>;
    type Options<T> = {
        graph: Graph<T>;
        groups: Groups<T>;
    };
    type Result<T> = {
        safe: boolean;
        chunks: Groups<T>;
        cycles: Groups<T>;
    };
    function graphSequencer<T>(opts: Options<T>): Result<T>;
    export = graphSequencer;
}

declare module 'jest-worker' {
    import { Readable } from 'stream';

    class Worker {
        constructor(path: string, options?: object);
        getStdout(): Readable;
        getStderr(): Readable;
        end(): void;
    }

    export default Worker;
}
