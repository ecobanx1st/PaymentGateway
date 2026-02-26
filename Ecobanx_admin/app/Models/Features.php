<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Features extends Model
{

    protected $table = 'features';
    protected $connection = 'mysql2';


    public static function updateFeatures($request)
    {
    	for($i=1;$i<=sizeof($request->heading);$i++)
        {   
            $features = Features::on('mysql2')->where('id',$i)->first();
            $features->heading = $request->heading[$i-1];
            $features->desc = $request->description[$i-1];
             $features->created_at = date('Y-m-d H:i:s');
            $features->save(); 
        }

        return $message = "Updated Successfully!";
    }
}
