import { HttpStatus } from "@nestjs/common";
import { HttpException } from "../http.exception";

export class PledgeNotFoundException extends HttpException {
    constructor(){
        super("해당하는 약속을 찾지 못했습니다.", HttpStatus.NOT_FOUND)
    }
}