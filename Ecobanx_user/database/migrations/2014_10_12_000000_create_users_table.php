<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->Increments('id');
            $table->string('role');
            $table->string('name');
            $table->string('email')->unique();
            $table->string('username')->unique();
            $table->string('password');
            $table->string('phone_no')->nullable();
            $table->string('country')->nullable();
            $table->string('profileimg')->nullable();
            $table->string('twofa')->nullable();
            $table->boolean('twofastatus')->default(0);
            $table->string('google2fa_secret')->nullable();
            $table->boolean('google2fa_verify')->default(0);
            $table->timestamp('email_verified_at')->nullable();
            $table->boolean('email_verify')->nullable();
            $table->integer('phone_verified')->default(0);
            $table->integer('kyc_verify')->default(0);
            $table->integer('profile_otp')->nullable();
            $table->boolean('status')->default(0);
            $table->text('reason')->nullable();
            $table->string('company_type')->nullable();
            $table->string('business_name')->nullable();
            $table->string('business_country')->nullable();
            $table->string('business_email')->nullable();
            $table->string('business_first_name')->nullable();
            $table->string('business_middle_name')->nullable();
            $table->string('business_last_name')->nullable();
            $table->string('phone_country')->nullable(); 
            $table->string('nationality')->nullable();
            $table->date('dob')->nullable();
            $table->enum('type', ['web', 'app'])->default('web');
            $table->string('verify_token')->nullable();
            $table->boolean('is_logged')->nullable()->default(0);
            $table->longtext('ipaddr')->nullable();
            $table->string('device')->nullable();
            $table->string('location')->nullable();
            $table->boolean('is_address')->default(0);
            $table->string('referral_id')->nullable();
            $table->string('parent_id')->nullable();
            $table->string('activation_token')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}
