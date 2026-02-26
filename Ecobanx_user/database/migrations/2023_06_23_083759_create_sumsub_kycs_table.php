<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSumsubKycsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::dropIfExists('sumsub_kycs');
        Schema::create('sumsub_kycs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('uid');
            $table->string('kyc_id')->nullable();
            $table->string('kycrequest_id')->nullable();
            $table->string('key')->nullable();
            $table->string('clientId')->nullable();
            $table->string('inspectionId')->nullable();
            $table->string('externalUserId')->nullable();
            $table->string('refuid')->nullable();
            $table->string('email')->nullable();
            $table->string('id_type')->nullable();
            $table->string('id_number')->nullable();
            $table->string('id_exp')->nullable();
            $table->string('front_img')->nullable();
            $table->string('back_img')->nullable();
            $table->string('selfie_img')->nullable();
            $table->string('status')->nullable();
            $table->string('remark')->nullable();
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
        Schema::dropIfExists('sumsub_kycs');
    }
}
