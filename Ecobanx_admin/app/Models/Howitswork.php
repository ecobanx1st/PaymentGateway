<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Howitswork extends Model
{

    protected $table = 'how_its_work';
    protected $connection = 'mysql2';


    public static function updatewrk($request)
    {
    	for($i=1;$i<=sizeof($request->heading);$i++)
        {   
            $how = Howitswork::on('mysql2')->where('id',$i)->first();
            $how->heading = $request->heading[$i-1];
            $how->desc = $request->description[$i-1];
            $how->created_at = date('Y-m-d H:i:s');
            $how->save(); 
        }

        return $message = "Updated Successfully!";
    }
}
