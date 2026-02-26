<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersApiSettingTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users_api_setting', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('api_id')->nullable();
            $table->integer('uid')->nullable();
            $table->string('key_name')->nullable();
            $table->string('api_ip')->nullable();
            $table->integer('basicinfo')->default(0);
            $table->integer('balance')->default(0);
            $table->integer('convert_coins')->default(0);
            $table->integer('deposit')->default(0);
            $table->integer('transaction')->default(0);
            $table->integer('deposit_history')->default(0);
            $table->integer('withdraw_history')->default(0);
            $table->integer('withdraw')->default(0);
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
        Schema::dropIfExists('users_api_setting');
    }
}
