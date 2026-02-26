<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersWalletsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::dropIfExists('users_wallets');
        Schema::create('users_wallets', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('uid')->unsigned();
            $table->foreign('uid')->references('id')->on('users');  
            $table->string('currency')->nullable();
            $table->text('mukavari')->nullable();
            $table->double('balance')->default(0);
            $table->double('escrow_balance')->default(0);
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
        Schema::dropIfExists('users_wallets');
    }
}
