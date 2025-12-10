export interface Banner {
  _id: string
  id?: string
  title: string
  subtitle: string
  description: string
  buttonText: string
  buttonLink: string
  backgroundImage: string
  image?: string
  cta?: string
  order?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateBannerRequest {
  title: string
  subtitle: string
  description?: string
  buttonText: string
  buttonLink?: string
  backgroundImage?: string
  isActive?: boolean
}

export interface UpdateBannerRequest extends Partial<CreateBannerRequest> {
  _id: string
}
