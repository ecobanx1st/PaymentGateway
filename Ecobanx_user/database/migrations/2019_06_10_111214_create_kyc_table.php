<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateKycTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('kyc', function (Blueprint $table) {
            $table->increments('kyc_id');
            $table->integer('uid')->unsigned();
            $table->foreign('uid')->references('id')->on('users');
            $table->string('fname')->nullable();
            $table->string('lname')->nullable();
            $table->date('dob');
            $table->string('city')->nullable();
            $table->string('id_document')->nullable();
            $table->string('country')->nullable();
            $table->string('id_type')->nullable();
            $table->text('id_number')->nullable();
            $table->date('id_exp');
            $table->string('front_img')->nullable();
            $table->string('back_img')->nullable();
            $table->integer('status')->default(0);
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
        Schema::dropIfExists('kyc');
    }
}
