import request from 'supertest';// mock HTTP requests
import app from '../../app'; // import the Express app
import { UserModel } from '../../model/user.model';

jest.mock('../../config/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

describe(
    'Authentication Routes', // test group/suite name
    () => { // function containing related tests
        const testUser = { // make this object as per your User schema
            name: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123',
        }
        beforeAll(async () => {
            // Clean up the test user if it already exists
            await UserModel.deleteMany({ email: testUser.email });
        });
        afterAll(async () => {
            // Clean up the test user after tests
            await UserModel.deleteMany({ email: testUser.email });
        });

        describe(
            'POST /api/auth/register', // test case group/suite name
            () => { // function containing related tests
                test( // individual test case
                    'should register a new user', // test case name
                    async () => { // test case function
                        const response = await request(app)
                            .post('/api/v1/auth/register')
                            .send(testUser);

                        expect(response.status).toBe(201);
                        expect(response.body).toHaveProperty('message', 'User created');
                        expect(response.body).toHaveProperty('success', true);
                    }
                )
                test(
                    'should not register a user with existing email', // test case name
                    async () => { // test case function
                        const response = await request(app)
                            .post('/api/v1/auth/register')
                            .send(testUser); // same user data
                        expect(response.status).toBe(403);
                        expect(response.body).toHaveProperty('message', 'Email already in use');
                        expect(response.body).toHaveProperty('success', false);
                    }
                )
            }
        )
        
        describe('POST /api/v1/auth/login', () => {
        test('should login successfully with correct credentials', async () => {
            const response = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password,
            });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
        });

        test('should fail login with wrong password', async () => {
            const response = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: testUser.email,
                password: 'wrongpassword',
            });

            expect(response.status).toBe(401);
        });

        test('should fail login with non-existing email', async () => {
            const response = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'fake@email.com',
                password: 'password123',
            });

            expect(response.status).toBe(401);
        });
        });


        describe('POST /api/v1/auth/forgot-password', () => {
        test('should send reset email for existing user', async () => {
            const response = await request(app)
            .post('/api/v1/auth/forgot-password')
            .send({ email: testUser.email });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            const user = await UserModel.findOne({ email: testUser.email });
            expect(user?.resetPasswordToken).toBeDefined();
            expect(user?.resetPasswordExpires).toBeDefined();
        });

        test('should fail for non-existing email', async () => {
            const response = await request(app)
            .post('/api/v1/auth/forgot-password')
            .send({ email: 'notfound@email.com' });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
        });
    }
);
