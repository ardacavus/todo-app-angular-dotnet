using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToDo.WebAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddPasswordResetFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastPasswordResetRequest",
                table: "AspNetUsers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PasswordResetRequestCount",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastPasswordResetRequest",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "PasswordResetRequestCount",
                table: "AspNetUsers");
        }
    }
}
