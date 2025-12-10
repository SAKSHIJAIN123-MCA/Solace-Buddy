

import EditHeroSlideClientPage from "./edit-hero-slide-client-page"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  return <EditHeroSlideClientPage id={id} />
}
