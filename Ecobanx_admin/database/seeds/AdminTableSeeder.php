<?php

use Illuminate\Database\Seeder;

class AdminTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('admins')->insert(
        [
            'email' => 'admin@cipayment.com',
            'password' => bcrypt('admin@12345678'),    
        ]);
    }
}
