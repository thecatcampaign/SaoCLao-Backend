import { IsEmail, IsString, MinLength, IsDefined } from 'class-validator';
export class CreateAccontDto {
    @IsEmail()
    @IsDefined()
    email: string;

    @IsString()
    @MinLength(4)
    password: string;

    @IsDefined()
    @IsString()
    username: string;

    @IsDefined()
    @IsString()
    name: string;

}
