import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { hashSync, compareSync } from 'bcrypt'
import { LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRespository: Repository<User>,
    private readonly jwtService: JwtService
  ) { }

  async create(createUserDto: CreateUserDto) {

    try {

      const { password, ...userData } = createUserDto;

      const user = this.userRespository.create({
        ...userData,
        password: hashSync(password, 10)
      });

      await this.userRespository.save(user);

      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({ email: user.email })
      }

    } catch (error) {
      this.habdleDBErrors(error)
    }
  }


  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    const user = await this.userRespository.findOne({
      where: {
        email
      },
      select: {
        email: true,
        password: true,
        id: true
      }
    });
    if (!user) throw new UnauthorizedException('Credentials are not valid (email)')
    if (compareSync(password, user.password)) throw new UnauthorizedException('Credentials are not valid (password)')
    return {
      ...user,
      token: this.getJwtToken({ email: user.email })
    }
  }
  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ email: user.email })
    }
  }
  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);

    return token;
  }

  private habdleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    console.log(error)
    throw new InternalServerErrorException('Please check server logs');
  }


}
