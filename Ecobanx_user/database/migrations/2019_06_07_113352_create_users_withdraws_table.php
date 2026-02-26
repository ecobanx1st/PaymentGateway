<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersWithdrawsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
       Schema::dropIfExists('users_withdraws');
        Schema::create('users_withdraws', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id')->unsigned();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('coin_name')->nullable();
            $table->string('sender')->nullable();
            $table->string('reciever')->nullable();
            $table->double('amount')->nullable();
            $table->double('request_amount')->nullable();
            $table->double('amounti')->nullable();
            $table->double('admin_fee')->nullable();
            $table->string('transaction_id')->nullable();
            $table->string('remark')->nullable();
            $table->string('status')->nullable();
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
        Schema::dropIfExists('users_withdraws');
    }
}
