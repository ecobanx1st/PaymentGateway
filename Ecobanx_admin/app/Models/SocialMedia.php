<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialMedia extends Model
{
    public static function index()
    {
        $socialMedia = SocialMedia::on('mysql2')->where('id','1')->first();

        return $socialMedia;
    }

    public static function saveSocialMedia($request)
    {

        $socialMedia = SocialMedia::on('mysql2')->where('id',1)->first();
        $socialMedia->pinterest = $request->pinterest;
        $socialMedia->fb = $request->fb;
        $socialMedia->twitter = $request->twitter;
        $socialMedia->instagram = $request->instagram;
        $socialMedia->telegram = $request->telegram;
        $socialMedia->save();

        return true;
    }
}
