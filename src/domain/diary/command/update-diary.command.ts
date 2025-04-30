export class UpdateDiaryCommand {
  constructor(
    public readonly diaryId: number,
    public readonly detail: string,
  ) {}
}
