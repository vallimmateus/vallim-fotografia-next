type MultiFid = {
  fid: string
  name: string
}

type Party = {
  id: string
  fid: string | MultiFid[]
  name: string
  cover: string
  date: string
  publishDate: string | null
}

type GlobalProps = {
  parties: Party[]
}
