type objectItem = string | string[] | number | number[] | null | boolean

type objectKetmar = Record<string, objectItem>

type obj = Record<string, objectItem | objectKetmar>

export type { objectItem, objectKetmar, obj }
