import FormEvent from './components/form'

export interface OrganizationOption {
  readonly value: string
  readonly label: string
  readonly name: string
  readonly logo?: string
  readonly type?: string
}

async function Register() {
  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <FormEvent />
    </div>
  )
}

export default Register
