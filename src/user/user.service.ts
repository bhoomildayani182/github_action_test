import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ResultSetHeader } from 'mysql2';
import { CreateUserDto } from './dto/create-user-dto';

@Injectable()
export class UserService {
  private readonly userRepository: Repository<User>;
  private readonly databaseService: DatabaseService;
  constructor(
    @InjectRepository(User)
    userRepository: Repository<User>,
    databaseService: DatabaseService,
  ) {
    this.userRepository = userRepository;
    this.databaseService = databaseService;
  }

  async get() {
    const sql = 'SELECT * FROM users';
    const conn = await this.databaseService.getConnection();
    const rows = conn.execute(sql);
    return rows;
  }

  async addUser(createUserDto: CreateUserDto) {
    const {
      first_name,
      last_name,
      username,
      email,
      password,
      country_code,
      mobile,
    } = createUserDto;
    const conn = await this.databaseService.getConnection();
    let conn2;
    try {
      await conn.beginTransaction(); // Start transaction

      const reqDbName = this.databaseService.getDatabaseName();
      const uuid = uuidv4();
      const pswd = Buffer.from(password).toString('base64');
      const hashPwd = await bcrypt.hash(password, 10);

      const [checkExist] = await conn.execute(
        'SELECT id FROM users WHERE email = ? OR username = ?',
        [email, username],
      );

      if ((checkExist as any[]).length > 0) {
        throw new BadRequestException(
          'Email or Username already exists. Please use a different one.',
        );
      }

      const sql = `INSERT INTO users (uuid,first_name,last_name,username,email,password,pswd,enforce_reset_password,country_code,mobile,role,role_id) VALUES
                  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const [insertUser] = await conn.execute<ResultSetHeader>(sql, [
        uuid,
        first_name,
        last_name,
        username,
        email,
        hashPwd,
        pswd,
        0,
        country_code,
        mobile,
        'user',
        0,
      ]);
      const userId = insertUser.insertId;

      const securityQuery = 'INSERT INTO login_securities (user_id) VALUES (?)';

      await conn.execute(securityQuery, [userId]);

      // Switch to new database
      const newDbName = 'qam_master';
      this.databaseService.setDatabase(newDbName);
      conn2 = await this.databaseService.getConnection();
      await conn2.beginTransaction(); // Start transaction for second DB

      const [existingUsers] = await conn2.execute(
        'SELECT id FROM login_master WHERE email = ? OR username = ?',
        [email, username],
      );

      if ((existingUsers as any[]).length > 0) {
        throw new BadRequestException(
          'Email or Username already exists. Please use a different one.',
        );
      }

      const code = reqDbName.split('_');
      const getCustDetail = 'SELECT id FROM customer_master WHERE code = ?';
      const [custId] = await conn2.execute(getCustDetail, [code[1]]);

      if (!custId || custId.length === 0) {
        throw new Error('Customer ID not found');
      }

      const insertLoginMaster =
        'INSERT INTO login_master (username, email, cust_id) VALUES (?, ?, ?)';
      await conn2.execute(insertLoginMaster, [username, email, custId[0].id]);

      // Commit both transactions
      await conn.commit();
      await conn2.commit();

      return {
        status: 'success',
        message: 'User added successfully!',
        user: { username: username, email: email },
      };
    } catch (error) {
      if (conn) {
        await conn.rollback();
      }
      if (conn2) {
        await conn2.rollback();
      }

      return {
        status: 'error',
        message: 'Failed to add user',
        error: error.message,
      };
    } finally {
      if (conn) {
        conn.release();
      } // Release connections
      if (conn2) {
        conn2.release();
      }
    }
  }

  findByUsername(username: string) {
    return this.userRepository.findOne({ where: { username } });
  }
}
