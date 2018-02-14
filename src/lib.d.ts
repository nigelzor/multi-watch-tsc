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
