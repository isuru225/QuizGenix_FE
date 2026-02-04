import { useRouter as nextUseRouter } from "next/navigation";

let _router: ReturnType<typeof nextUseRouter> | null = null;

export const setRouter = (router: ReturnType<typeof nextUseRouter>) => {
    _router = router;
};

export const getRouter = () => _router!;