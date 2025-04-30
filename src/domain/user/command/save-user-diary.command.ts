export class SaveUserDiaryCommand {
  constructor(
    public readonly userId: string,
    public readonly diaryId: number,
  ) {}
}
