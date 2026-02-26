<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateOrderTransactionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('order_transactions', function (Blueprint $table) {
            $table->increments('id');            
            $table->integer('uid')->unsigned();
            $table->foreign('uid')->references('id')->on('users');
            $table->string('txn_id',90)->nullable();
            $table->string('payment_address',90)->nullable();
            $table->string('currency1',6)->nullable();
            $table->string('currency2',6)->nullable();
            $table->double('amount1')->nullable();
            $table->double('amount2')->nullable();
            $table->double('subtotal')->nullable();
            $table->boolean('shipping')->default(0);
            $table->double('tax')->default(0);
            $table->double('fee')->default(0);
            $table->double('net')->default(0);
            $table->double('item_amount');
            $table->string('item_name',90);
            $table->string('item_desc',150)->nullable();
            $table->string('ipn_url',150)->nullable();
            $table->integer('quantity')->default(1);
            $table->integer('item_number')->default(1);            
            $table->string('invoice',150)->nullable();
            $table->string('custom',150)->nullable();
            $table->string('on1',150)->nullable();
            $table->double('ov1')->nullable();
            $table->string('on2',150)->nullable();
            $table->double('ov2')->nullable();
            $table->string('extra',180)->nullable();
            $table->double('received_amount')->nullable();
            $table->integer('received_confirms')->nullable();
            $table->integer('status')->nullable();
            $table->string('status_text')->nullable();
            $table->string('secret',100)->nullable();
            $table->integer('order_count')->default(0);
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
        Schema::dropIfExists('order_transactions');
    }
}
