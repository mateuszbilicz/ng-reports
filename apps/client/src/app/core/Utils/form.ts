/** Convert swagger DTO into FormGroup type */
export type IForm<T> = {
  [K in keyof T]?: any;
}
