export interface UserDto {
  id: number;
  username: string;
  displayName: string;
  createdAt: string;
}

export interface PostItDto {
  id: number;
  userId: number;
  title: string;
  description: string;
  tags: string;
  createdAt: string;
  deadlineDate: string | null;
  completed: boolean;
  archived: boolean;
  positionX: number;
  positionY: number;
  zIndex: number;
  colorHex?: string;
}

/** JSON kan camelCase of snake_case gebruiken voor kleur. */
export function readPostItColorHexFromDto(p: PostItDto): string | undefined {
  const camel = p.colorHex?.trim();
  if (camel) {
    return camel;
  }
  const snake = (p as unknown as { color_hex?: string }).color_hex?.trim();
  return snake || undefined;
}
