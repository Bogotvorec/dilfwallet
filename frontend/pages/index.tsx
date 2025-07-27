import axios from 'axios'
import { GetServerSideProps } from 'next'

type Props = { message: string }

export default function Home({ message }: Props) {
  return <main className="flex items-center justify-center min-h-screen">
    <h1 className="text-3xl font-bold text-center">{message}</h1>
  </main>
}

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await axios.get('http://localhost:8000/')
  return { props: { message: res.data.message } }
}
