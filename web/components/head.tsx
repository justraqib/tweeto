import Head from 'next/head'

interface IMyHeadProps {
    title: string
}

export default function MyHead({ title }: IMyHeadProps) {
    return (
        <Head>
            <title>{title}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.svg" />
        </Head>
    )
}
