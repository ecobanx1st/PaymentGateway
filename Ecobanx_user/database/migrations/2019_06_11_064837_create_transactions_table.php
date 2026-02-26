<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTransactionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->increments('id');            
            $table->integer('uid')->unsigned();
            $table->foreign('uid')->references('id')->on('users');
            $table->string('txn_id',90)->nullable();
            $table->string('from_address',90)->nullable()->comment('Coin address the payment was received on.');
            $table->string('to_address',90)->nullable()->comment('Coin address the payment was send on.');
            $table->integer('status')->default(0)->comment('Numeric status of the payment, currently 0 = pending and 100 = confirmed/complete.');    
            $table->string('status_text',90)->nullable()->comment('A text string describing the status of the payment.');
            $table->string('txtype')->nullable();
            $table->string('currency',6)->nullable();
            $table->string('confirms',6)->nullable();
            $table->double('amount')->nullable()->comment('The total amount of the payment');
            $table->double('amounti')->nullable()->comment('The total amount of the payment in Satoshis');
            $table->double('fee')->nullable()->comment('The fee deducted by CoinPayments (only sent when status >= 100');
            $table->double('feei')->nullable()->comment('The fee deducted by CoinPayments in Satoshis');
            $table->integer('nirvaki_nilai')->default(0);
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
        Schema::dropIfExists('transactions');
    }
}
