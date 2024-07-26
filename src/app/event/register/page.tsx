import { FormEvent } from './components/form'

async function getOrganizations() {
  const basePath =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://' + process.env.NEXT_PUBLIC_VERCEL_URL
  const response = await fetch(basePath + '/api/organization', {
    next: {
      tags: ['get-organizations'],
    },
  })
  const {
    data: { organizations },
  } = await response.json()
  return organizations
}

export default async function Page() {
  const organizations = await getOrganizations()
  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <FormEvent initialOrganizations={organizations} />
    </div>
  )
}
