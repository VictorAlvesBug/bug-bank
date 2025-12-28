function createObjectProxy<T extends object>(
  target: T,
  hooks?: {
    get?: (prop: keyof T, value: any) => void
    set?: (prop: keyof T, value: any) => void
  }
): T {
  return new Proxy(target, {
    get(obj, prop, receiver) {
      const value = Reflect.get(obj, prop, receiver)
      hooks?.get?.(prop as keyof T, value)
      return value
    },
    set(obj, prop, value, receiver) {
      hooks?.set?.(prop as keyof T, value)
      return Reflect.set(obj, prop, value, receiver)
    },
  })
}
export default createObjectProxy;