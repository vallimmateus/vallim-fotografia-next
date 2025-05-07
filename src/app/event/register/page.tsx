import { getOrganizations } from './actions/get-organizations'
import { FormEvent } from './form'

export default async function Page() {
  const organizationsWithLogo = await getOrganizations()

  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <FormEvent initialOrganizations={organizationsWithLogo} />
    </div>
  )
}
